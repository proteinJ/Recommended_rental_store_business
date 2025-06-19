document.addEventListener('DOMContentLoaded', function () {
    var mapContainer = document.getElementById('map');
    var mapOption = {
      center: new kakao.maps.LatLng(35.0859618481399, 128.978471046232),
      level: 7
    };
    var map = new kakao.maps.Map(mapContainer, mapOption);
    var geocoder = new kakao.maps.services.Geocoder();
    var currentSearchMarker = null;
  
    // 팝업(오른쪽 창) 관련
    const openPopupButton = document.getElementById('openPopupButton');
    const closePopupButton = document.getElementById('closePopupButton');
    const popup = document.getElementById('popup');
    const internalCloseButton = popup.querySelector('.close-button');
  
    function updateButtonVisibility() {
      if (!openPopupButton || !closePopupButton || !popup) return;
      if (popup.classList.contains('active')) {
        openPopupButton.style.display = 'none';
        closePopupButton.style.display = 'block';
      } else {
        openPopupButton.style.display = 'block';
        closePopupButton.style.display = 'none';
      }
    }
    function openPopup() {
      if (popup && !popup.classList.contains('active')) {
        popup.classList.add('active');
        updateButtonVisibility();
      }
    }
    function closePopup() {
      if (popup && popup.classList.contains('active')) {
        popup.classList.remove('active');
        updateButtonVisibility();
      }
    }
    if (openPopupButton) openPopupButton.addEventListener('click', openPopup);
    if (closePopupButton) closePopupButton.addEventListener('click', closePopup);
    if (internalCloseButton) internalCloseButton.addEventListener('click', closePopup);
  
    document.addEventListener('click', function (event) {
      if (
        popup &&
        !popup.contains(event.target) &&
        openPopupButton && !openPopupButton.contains(event.target) &&
        closePopupButton && !closePopupButton.contains(event.target) &&
        mapContainer && !mapContainer.contains(event.target) &&
        popup.classList.contains('active')
      ) {
        closePopup();
      }
    });
    updateButtonVisibility();
  
    // 메시지 팝업 함수
    function showMessage(message, isError = false) {
      const messageParent = document.getElementById('searchContainer');
      const existingPopup = messageParent ? messageParent.querySelector('.message-popup') : document.querySelector('.message-popup');
      if (existingPopup) existingPopup.remove();
      const messagePopup = document.createElement('div');
      messagePopup.className = 'message-popup';
      messagePopup.textContent = message;
      if (isError) messagePopup.classList.add('error');
      if (messageParent) {
        messageParent.appendChild(messagePopup);
      } else {
        document.body.appendChild(messagePopup);
      }
      setTimeout(() => {
        messagePopup.style.animation = 'fadeOut 0.3s ease-in-out forwards';
        setTimeout(() => messagePopup.remove(), 300);
      }, 3000);
    }
  
    // 지도 중심 이동 함수
    function adjustMapToMarker(markerPosition) {
      map.setCenter(markerPosition);
      map.setLevel(3);
      openPopup();
    }
  
    // 군구별 마커/row 정보 저장
    const markerMap = {}; // {군구: {marker, lat, lng, address, row}}
    let rowMap = {}; // 모든 row 정보 저장용
  
    // 팝업 내용 갱신 함수 (연도별 거래가 포함)
    function setPopupInfo(군구, row) {
      // 위치(군구명)
      const locationTitle = popup.querySelector('.popup-location');
      if (locationTitle) locationTitle.textContent = 군구;
  
      // 단지명(구청 등)
      const complexName = popup.querySelector('.popup-complex-name');
      if (complexName) complexName.textContent = '구청';
  
      // 날짜(오늘로)
      const dateField = popup.querySelector('.popup-date');
      if (dateField) dateField.textContent = new Date().toISOString().slice(0, 10);
      
      // 그래프
      const graphImg = popup.querySelector('#predict-graph-img');
      if (graphImg && 군구) {
          // 예시: 군구명에 따라 그래프 이미지 파일명 지정
          const fileName = 군구.replace(/\s/g, '') + '_graph.jpg';
          graphImg.src = '/static/images/graphs/' + fileName;
          graphImg.alt = 군구 + ' 분석 그래프';
      }

      // 주소
      const addressField = popup.querySelector('.current-location-item:nth-child(2) p');
      if (addressField && row['도로명주소']) addressField.textContent = row['도로명주소'];
  
      // 연도별 거래가 표 넣기
      const yearTableDiv = popup.querySelector('.predict-year-price-table');
      if (yearTableDiv && row) {
        const years = Object.keys(row).filter(col => /^\d{4}$/.test(col));
        const prices = years.map(y => row[y]);
        let tableHtml = "<table class='year-table' style='width:100%;text-align:center;'><tr>" + years.map(y => `<th>${y}</th>`).join('') + "</tr>";
        tableHtml += "<tr>" + prices.map(p => `<td>${p}</td>`).join('') + "</tr></table>";
        yearTableDiv.innerHTML = tableHtml;
      }
    }
  
    // 마커 생성 및 클릭 이벤트 부착
    function createAndAddMarker(lat, lng, 군구, address, row) {
      const coords = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({
        position: coords,
        map: map,
        title: 군구
      });
  
      markerMap[군구] = {
        marker: marker,
        lat: lat,
        lng: lng,
        address: address,
        군구: 군구,
        row: row
      };
  
      kakao.maps.event.addListener(marker, 'click', function () {
        adjustMapToMarker(marker.getPosition());
        setPopupInfo(군구, row);
      });
      return marker;
    }
  
    // CSV 파일 로드 및 구청(군구) 마커 표시
    window.onload = function () {
      fetch('/static/data/output.csv')
        .then(response => response.text())
        .then(csvText => {
          const parsed = Papa.parse(csvText, { header: true });
          rowMap = {}; // (초기화)
          parsed.data.forEach((row, idx) => {
            const address = row['도로명주소'];
            const 군구 = row['군구'];
            if (address && 군구) {
              rowMap[군구] = row;
              setTimeout(() => {
                geocoder.addressSearch(address, function (result, status) {
                  if (status === kakao.maps.services.Status.OK) {
                    const lat = result[0].y;
                    const lng = result[0].x;
                    createAndAddMarker(lat, lng, 군구, address, row);
                  }
                });
              }, 0 * idx);
            }
          });
        })
        .catch(error => {
          console.error("CSV 파일 로딩 중 오류 발생:", error);
        });
    };
  
    // 검색 버튼 클릭 시 군구 또는 도로명주소 검색
    document.getElementById('searchButton').addEventListener('click', function () {
      var keyword = document.getElementById('addressInput').value.trim();
      var resultInfoDiv = document.getElementById('resultInfo');
  
      if (!keyword) {
        showMessage('군구명 또는 도로명주소를 입력해주세요.', true);
        if (resultInfoDiv) resultInfoDiv.innerHTML = '';
        if (currentSearchMarker) {
          currentSearchMarker.setMap(null);
          currentSearchMarker = null;
        }
        return;
      }
  
      // 1. 군구명으로 바로 포커싱
      if (markerMap[keyword]) {
        const data = markerMap[keyword];
        const position = new kakao.maps.LatLng(data.lat, data.lng);
        adjustMapToMarker(position);
  
        // 검색 마커 표시 (기존 마커 지움)
        if (currentSearchMarker) {
          currentSearchMarker.setMap(null);
          currentSearchMarker = null;
        }
        currentSearchMarker = new kakao.maps.Marker({
          position: position,
          map: map,
          title: data.군구 || keyword,
          clickable: false
        });
  
        if (resultInfoDiv) {
          resultInfoDiv.innerHTML = `검색된 군구: ${data.군구 || keyword}<br>주소: ${data.address}<br>위도: ${data.lat}, 경도: ${data.lng}`;
        }
  
        showMessage(`'${keyword}' 위치로 이동했습니다.`);
        setPopupInfo(data.군구, data.row);
        return;
      }
  
      // 2. 도로명주소로 검색 (파일에서 검색)
      fetch('/static/data/data.csv')
        .then(response => response.text())
        .then(csvText => {
          const parsed = Papa.parse(csvText, { header: true });
          const found = parsed.data.find(row =>
            (row['도로명주소'] && row['도로명주소'].includes(keyword))
          );
          if (found) {
            geocoder.addressSearch(found['도로명주소'], function (result, status) {
              if (status === kakao.maps.services.Status.OK) {
                const lat = result[0].y;
                const lng = result[0].x;
                const position = new kakao.maps.LatLng(lat, lng);
  
                if (currentSearchMarker) {
                  currentSearchMarker.setMap(null);
                  currentSearchMarker = null;
                }
                currentSearchMarker = new kakao.maps.Marker({
                  position: position,
                  map: map,
                  title: found['군구'],
                  clickable: false
                });
  
                adjustMapToMarker(position);
  
                if (resultInfoDiv) {
                  resultInfoDiv.innerHTML = `검색된 주소: ${found['도로명주소']}<br>군구: ${found['군구']}<br>위도: ${lat}, 경도: ${lng}`;
                }
                showMessage(`'${found['군구']}' 위치로 이동했습니다.`);
                setPopupInfo(found['군구'], found);
              } else {
                showMessage('주소 검색 중 오류가 발생했습니다.', true);
                if (resultInfoDiv) resultInfoDiv.innerHTML = '';
                if (currentSearchMarker) {
                  currentSearchMarker.setMap(null);
                  currentSearchMarker = null;
                }
              }
            });
          } else {
            showMessage('검색 결과가 존재하지 않습니다. 다시 확인해주세요.', true);
            if (resultInfoDiv) resultInfoDiv.innerHTML = '';
            if (currentSearchMarker) {
              currentSearchMarker.setMap(null);
              currentSearchMarker = null;
            }
          }
        })
        .catch(error => {
          showMessage('CSV 파일 로딩 중 오류가 발생했습니다.', true);
          console.error(error);
        });
    });
  
    // 엔터 키 입력 시 검색 실행
    document.getElementById('addressInput').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        document.getElementById('searchButton').click();
      }
    });
  });
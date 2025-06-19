document.addEventListener('DOMContentLoaded', function () {
  // 카카오 JS SDK가 로드된 후 실행
  function initMapLogic() {
    var mapContainer = document.getElementById('map');
    if (!mapContainer) return; // map div가 없으면 종료

    var mapOption = {
      center: new kakao.maps.LatLng(35.1796, 129.0756),
      level: 8
    };
    var map = new kakao.maps.Map(mapContainer, mapOption);
    var geocoder = new kakao.maps.services.Geocoder();
    var currentSearchMarker = null;

    // 팝업(오른쪽 창) 관련
    const openPopupButton = document.getElementById('openPopupButton');
    const closePopupButton = document.getElementById('closePopupButton');
    const popup = document.getElementById('popup');
    const internalCloseButton = popup ? popup.querySelector('.close-button') : null;

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
      const offsetX = 0.004;
      const newLng = markerPosition.getLng() + offsetX;
      const newPosition = new kakao.maps.LatLng(markerPosition.getLat(), newLng);

      map.setCenter(newPosition);
      map.setLevel(6);
      openPopup();
    }

    // 군구별 마커/row 정보 저장
    const markerMap = {};
    let rowMap = {};

    // 팝업 내용 갱신 함수 (연도별 거래가 포함)
    function setPopupInfo(군구, row) {
      const locationTitle = popup.querySelector('.popup-location');
      if (locationTitle) locationTitle.textContent = 군구;
      
      const graphImg = popup.querySelector('#predict-graph-img');
      if (graphImg && 군구) {
          const fileName = 군구.replace(/\s/g, '') + '_graph.jpg';
          graphImg.src = '/static/images/graphs/' + fileName;
          graphImg.alt = 군구 + ' 분석 그래프';
      }
      const addressField = popup.querySelector('.current-location-item:nth-child(2) p');
      if (addressField && row && row['도로명주소']) addressField.textContent = row['도로명주소'];
  
      const yearTableDiv = popup.querySelector('.predict-year-price-table');
      if (yearTableDiv && row) {
          // 모든 연도 키를 추출하고 정렬
          const allYears = Object.keys(row).filter(col => /^\d{4}$/.test(col)).sort();
  
          // 현재/과거 연도와 예측 연도 분리
          const currentPastYears = allYears.filter(year => parseInt(year) <= 2024); // 2024년까지
          const futureYears = allYears.filter(year => parseInt(year) >= 2025 && parseInt(year) <= 2030); // 2025년부터 2030년까지
  
          // 가격 포매팅 헬퍼 함수
          const formatPrice = (priceStr) => {
              let price = parseFloat(priceStr);
              if (isNaN(price) || price === 0) {
                  return '-'; // 가격이 없거나 0이면 '-'로 표시
              }
              return (price / 10000).toFixed(2) + '억원'; // 억 단위로 변환 및 포맷팅
          };
  
          let tableHtml = "<table class='year-table' style='width:100%;text-align:center;border-collapse:collapse;'>"; // border-collapse 추가
  
          // 1. 과거/현재 데이터 행
          if (currentPastYears.length > 0) {
              tableHtml += "<thead><tr><th colspan='" + currentPastYears.length + "' style='background-color:#f0f0f0; padding: 5px;'>과거 거래가</th></tr></thead>";
              tableHtml += "<tbody style='width: 100%;'>";
              tableHtml += "<tr>" + currentPastYears.map(y => `<th>${y}년</th>`).join('') + "</tr>"; // 연도 헤더
              tableHtml += "<tr>" + currentPastYears.map(y => `<td>${formatPrice(row[y])}</td>`).join('') + "</tr>"; // 가격 데이터
              tableHtml += "</tbody>";
          } 
  
          // 2. 예측 데이터 행 (2025년부터 2030년)
          if (futureYears.length > 0) {
              // 예측 데이터 헤더 행
              tableHtml += "<thead><tr><th colspan='" + futureYears.length + "' style='background-color:#e0ffe0; padding: 5px;'>예측 거래가</th></tr></thead>";
              tableHtml += "<tbody>";
              tableHtml += "<tr>" + futureYears.map(y => `<th>${y}년</th>`).join('') + "</tr>"; // 연도 헤더
              tableHtml += "<tr>" + futureYears.map(y => `<td>${formatPrice(row[y])}</td>`).join('') + "</tr>"; // 가격 데이터
              tableHtml += "</tbody>";
          }
          
          tableHtml += "</table>";
          
          yearTableDiv.innerHTML = tableHtml;
      } else if (yearTableDiv) {
          yearTableDiv.innerHTML = "<p>연도별 거래가 정보가 없습니다.</p>";
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
    fetch('/static/data/output.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsed = Papa.parse(csvText, { header: true });
        rowMap = {};
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

    // 검색 버튼 클릭 시 군구 또는 도로명주소 검색
    const searchButton = document.getElementById('searchButton');
    const addressInput = document.getElementById('addressInput');
    if (searchButton && addressInput) {
      searchButton.addEventListener('click', function () {
        var keyword = addressInput.value.trim();
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
      addressInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          searchButton.click();
        }
      });
    }
  }

  // 카카오 JS SDK가 로드된 후 실행 보장
  if (window.kakao && window.kakao.maps) {
    initMapLogic();
  } else {
    let checkKakao = setInterval(function () {
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkKakao);
        initMapLogic();
      }
    }, 100);
  }
});
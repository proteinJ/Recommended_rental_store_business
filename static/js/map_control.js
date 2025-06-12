document.addEventListener('DOMContentLoaded', function() {
  window.onload = function() {
    fetch('/static/data/apartment_data_saha.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsed = Papa.parse(csvText, { header: true });
        parsed.data.forEach((row, idx) => {
          const address = row['도로명주소'];
          if (address) {
            setTimeout(() => {
              geocoder.addressSearch(address, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                  const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                  new kakao.maps.Marker({
                    position: coords,
                    map: map
                  });
                }
              });
            }); // 0.3초 간격
          }
        });
      });

    var mapContainer = document.getElementById('map'), // 지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(35.0859618481399, 128.978471046232), // 초기 중심 좌표 (예: 부산 시청)
            level: 7 // 지도의 확대 레벨
    };

    // 지도를 생성합니다
    var map = new kakao.maps.Map(mapContainer, mapOption);

    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 마커를 미리 생성해 둡니다 (이후 재사용)
    var marker = new kakao.maps.Marker({
        map: map // 처음에는 지도에 표시하지 않음
    });
  };

  // 검색 버튼 클릭 이벤트 리스너
  document.getElementById('searchButton').addEventListener('click', function() {
      var address = document.getElementById('addressInput').value;

      if (!address) {
          alert('주소를 입력해주세요.');
          return;
      }

      // 주소로 좌표를 검색합니다
      geocoder.addressSearch(address, function(result, status) {
          var resultInfoDiv = document.getElementById('resultInfo');

          // 정상적으로 검색이 완료됐으면
          if (status === kakao.maps.services.Status.OK) {
              var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

              resultInfoDiv.innerHTML = `검색된 주소: ${address}<br>위도: ${result[0].y}, 경도: ${result[0].x}`;

              // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
              map.setCenter(coords);

              // 마커를 결과값으로 받은 위치로 옮기고 지도에 표시합니다
              marker.setPosition(coords);
              marker.setMap(map); // 마커를 지도에 표시
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
              resultInfoDiv.innerHTML = '검색 결과가 존재하지 않습니다. 다시 확인해주세요.';
              marker.setMap(null); // 기존 마커가 있다면 제거
          } else if (status === kakao.maps.services.Status.ERROR) {
              resultInfoDiv.innerHTML = '주소 검색 중 오류가 발생했습니다.';
              marker.setMap(null); // 기존 마커가 있다면 제거
          }
      });
  });

  // 엔터 키 입력 시 검색 실행
  document.getElementById('addressInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          document.getElementById('searchButton').click();
      }
  });
});
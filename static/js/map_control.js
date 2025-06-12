fetch('/static/data/output.csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.trim().split('\n');
    const latlngList = rows.slice(1).map(row => {
      const cols = row.split(',');
      return {
        위도: parseFloat(cols[10]),
        경도: parseFloat(cols[11])
      };
    });
    const neededLatlng = latlngList.slice(999, 1091);
    console.log(neededLatlng);

    // 네이버 지도 객체 생성
    var map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(35.106262885, 128.966759715),
      zoom: 15
    });

    // neededLatlng의 모든 좌표에 마커 생성
    neededLatlng.forEach(item => {
      new naver.maps.Marker({
        position: new naver.maps.LatLng(item.위도, item.경도),
        map: map
      });
    });
  });
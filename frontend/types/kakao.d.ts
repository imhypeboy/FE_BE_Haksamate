declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        event: {
          addListener: (target: any, type: string, handler: Function) => void
          removeListener?: (
            target: any,
            type: string,
            handler: (...args: any[]) => void
          ) => void // 실제론 없어도 타입 에러 방지
        }
        services: {
          Geocoder: new () => {
            coord2Address: (lng: number, lat: number, callback: Function) => void
            addressSearch: (address: string, callback: Function) => void
          }
          Places: new () => {
            keywordSearch: (keyword: string, callback: Function) => void
          }
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
        }
        load: (callback: Function) => void
      }
    }
  }
}

export {}

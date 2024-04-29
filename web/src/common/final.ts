interface IFinalData {
  [language: string]: {
    [userName: string]: number // last final index
  }
}

export class FinalManger {
  finalData: IFinalData = {}

  constructor() {}

  getIndex(language: string, userName: string): number {
    const data = this.finalData?.[language]
    let index = data?.[userName]
    if (!index) {
      index = this._getMaxIndex(language) + 1
    }
    return index
  }

  setIndex(language: string, userName: string, index: number) {
    if (!this.finalData[language]) {
      this.finalData[language] = {}
    }
    this.finalData[language][userName] = index
  }

  reset() {
    this.finalData = {}
  }

  // ------------ private -------------
  _getMaxIndex(language: string): number {
    const data = this.finalData?.[language]
    let maxIndex = 0
    for (const key in data) {
      if (data[key] > maxIndex) {
        maxIndex = data[key]
      }
    }
    return maxIndex
  }
}

export const finalManager = new FinalManger()

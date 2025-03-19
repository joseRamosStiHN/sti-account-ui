export interface PeriodModel {
  id?:number
  periodName?: string
  closureType: string
  startPeriod: Date | null
  endPeriod?: Date
  daysPeriod?: number
  status: boolean,
  periodStatus:string,
  isClosed?:boolean,
  isAnnual:boolean
  }
  
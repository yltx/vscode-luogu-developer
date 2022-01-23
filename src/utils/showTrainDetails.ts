import { searchTrainingdetail } from './api'
import md from './markdown'
export const showTrainDetails = async (id:any) => {
  const data = await searchTrainingdetail(id)
  console.log(data)
  return ``
}
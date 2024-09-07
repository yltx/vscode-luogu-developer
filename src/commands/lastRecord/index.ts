import SuperCommand from '../SuperCommand';
import showRecord from '@/utils/showRecord';
import { fetchRecords } from '@/utils/api';

export default new SuperCommand({
  onCommand: 'lastRecord',
  handle: async () => {
    await globalThis.luogu.waitinit;
    const records = await fetchRecords();
    if (records?.currentData?.records?.result?.length) {
      const rid = records.currentData.records.result[0].id as number;
      console.log(rid);
      await showRecord(rid);
    }
  }
});

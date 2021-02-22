const regex = /([^=]+)=([^;]+);?\s*/g
const m = regex.exec('__client_id=4ac35859897530171325faaf74fc60d673ff9314; _uid=0')
if (m !== null){
    let clientid = ''
    m.forEach((match) => {clientid = match})
    console.log(clientid)
}

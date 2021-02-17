function parseDateFromImageFileName(file) {
  //we have files of the format NAME_YYYYMMDD_HHmmSS_sss_NUMBERS.png
  //we need to convert this to NAME and YYYY-MM-DD HH:mm:SS.sss
  //Example: FF_IE0001_20200403_051538_014_0857856.png
  const dateRegex = /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(\d{3})/
  const testRegex = /(.*)_(\d{8})_(\d{6})_(\d{3})(.*)(\.png)/

  if ( testRegex.test(file) ) {
    const rawDateString = file.match(dateRegex)[0]
    const dateString = rawDateString.replace(dateRegex, "$1-$2-$3 $4:$5:$6.$7 GMT")
    const date = new Date(dateString)
    
    const camera = file.match(testRegex)[1]
    
    return {date, camera}
  }

  return {}
}

module.exports = parseDateFromImageFileName


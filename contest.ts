<script>
            function displayranklist(ranklist) {
                var i = 0
                var ans = '<table>\\n<tr>\\n<th>名次</th>\\n<th>参赛者</th>\\n<th>总分</th>\\n'
                for (;i < ${contest['problemCount']}; i++) {
                    ans += '<th>' + String.fromCharCode(65 + i) + '</th>\\n'
                }
                ans += '</tr>\\n'
                for (i = 0;i < Math.min(ranklist['result']['perPage'],ranklist['result']['count']);i++) {
                    ans += '<th' + 'style="${getUsernameStyle(ranklist['result'][i]['user']['color'])}"' + '>#' + i.toString() + '</th>\\n<th>' + ranklist['result'][i]['user']['name'] + '${getUserSvg(ranklist['result'][i]['user']['ccfLevel'])}' + '</th>\\n<th>' + ranklist['result'][i]['score'] + '</th>\\n'
                    var j = 0
                    for (;j < ${contest['problemCount']};j++) {
                        ans += '<th>' + ranklist['result'][i]['details'][${contest['contestProblems'][j]}] + '</th>\\n'
                    }
                }
                ans += '</tr>\\n</table>\\n'
                return ans
            }
            document.getElementById("showranklist").innerHTML = displayranklist(${ JSON.stringify(ranklist)})
        </script>
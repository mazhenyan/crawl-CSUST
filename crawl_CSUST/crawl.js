var http=require('http');
var cheerio = require('cheerio');
var fs = require("fs");
var iconv = require("iconv-lite");
var xlsx = require('node-xlsx');
var html=[];
var len = 0;
var option={
    hostname:'xk.csust.edu.cn',
    path:'/jxjh/Stu_byfakc_rpt.aspx',
    method:'GET',
    headers:{
        'Accept':'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding':'gzip, deflate',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',
        'Accept-Charset': 'GB2312,utf-8;q=0.7,*;q=0.7',
        'Cookie':'ASP.NET_SessionId=fxsxua4501cp3rimcdiaht45',
        'Host':'xk.csust.edu.cn',
        'Referer':'http://xk.csust.edu.cn/znpk/Pri_StuSel_rpt.aspx?m=eLaAlQb9iK85yLR',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
    }
};
var req=http.request(option,function(res){
    res.on('data',function(data){
        html.push(data);
        len += data.length;
    });
    res.on('end',function(){
        var dataAll = Buffer.concat(html,len);
        var strJson = iconv.decode(dataAll,'gb2312');
        var the_course = filterCourse(strJson);
    })
});
req.on('error',function(e){
    console.log('Error:'+e.message)
});
req.end();

function filterCourse(html) {
    var $ = cheerio.load(html);
    //the title
    var t = $('.only-bottom');
    var datas = [];
    var data1 = [];
    t.each(function (item) {
        var con = $(this);
        data1.push(con.text());
    });
    datas.push(data1);
//    the content
    var B = $('.B');
    console.log(B.length);
    var H = $('.H');
    var coun=0;
    for(var j=0;j<B.length;j++){
        var dataB1=[] , dataH1 = [];
        var tdsB = $('.B').eq(j).find('td');
        var tdsH = $('.H').eq(j).find('td');
        for(var i=0;i<tdsB.length;i++){
            console.log("B = "+tdsB.eq(i).text());
            dataB1.push(tdsB.eq(i).text());
        }
        for(var i=0;i<tdsH.length;i++){
            console.log("H = "+tdsH.eq(i).text());
            dataH1.push(tdsH.eq(i).text());
        }
        datas.push(dataB1);
        datas.push(dataH1);
        writeXls(datas);
    }
}
function writeXls(datas) {
    var buffer = xlsx.build([
        {
            name:'sheet1',
            data:datas
        }
    ]);
    fs.writeFileSync('the_content.xlsx',buffer,{'flag':'w'});   //生成excel
}
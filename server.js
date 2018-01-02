var express = require('express')
var app = express()

const bodyParser = require('body-parser')
var request = require("request")

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// initialize routes
//app.use('/api', require('./routes/api'));

// error handling middleware
app.use(function(err, req, res, next){
    console.log(err); // to see properties of message in our console
    res.status(422).send({error: err.message})
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html')
});


app.get("/MF",function (request, response) {
    getMF()
    .then(re =>{ console.log('helooo*******')
        console.log(re)
        response.json(re)
    })
});

//create Fail type instead of rejecting promise
function Fail(details){this.details=details}
const isFail = item => (item&&item.constructor)===Fail

function getMF(){
    var mfIds = ["118990", "120550", "118534"]
    let   sequentialMF = mfIds =>
    mfIds.reduce(//reduce ids to one promise
        (acc,mfId) =>
        acc.then(//acc is the one promise resolving to array of result or Fail items
            results => {
            var options = {
                //https://www.quandl.com/api/v3/datasets/AMFI/103504.json?api_key=WfUR65SA5p1PzpBysgK4
                method: 'GET',
                url: 'https://www.quandl.com/api/v3/datasets/AMFI/' + mfId + '.json',
                qs: { api_key: 'WfUR65SA5p1PzpBysgK4' },
            };
            return new Promise(//make the request as promise
                (resolve,reject)=>
                request(options, function (err, response, body) {
                    if(err){
                    reject(err);//reject if there is an error
                    }
                    var obj = JSON.parse(body);
                    resolve({//resolve if there is no error
                    "code": obj.dataset.dataset_code,
                    "name": obj.dataset.name,
                    "date": obj.dataset.end_date,
                    "nav": obj.dataset.data[0][1]
                    });
                })
            )
            .then(
                result=>{//add result item to results if successfull
                results.push(result)
                return results
                }
            )
            .catch(
                err=>{//add Fail item to results if failed
                results.push(new Fail([err,mfId]))
                return results
                }
            )
            .then(
                results=>
                new Promise(//wait for one second to make the next request
                    (resolve,reject)=>
                    setTimeout(
                        _=>resolve(results)
                        ,1000
                    )
                )
            )
            }
        )
        ,Promise.resolve([])
    );
    return sequentialMF(mfIds)
    .then(
        results=>{
        const successes = results.filter(result=>!isFail(result))
        const failed = results.filter(isFail)
        console.log('******hhhh*')
        console.log(successes)
        console.log(failed)
        console.log('*******')
        return results
    })
    /*  .then(re =>{ console.log('helooo*******')
                return  new Promise(
                    (resolve,reject)=>{
                            console.log(re)    
                            resolve(re) 
                    })          
                            
    })*/
}

app.listen(3000, function () {
    console.log("listen on port 3000")
})
// var listener = app.listen(process.env.PORT, function () {
//     console.log('Your app is listening on port ' + listener.address().port);
//   });
  

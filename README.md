# Tyk Gateway Docker

This container only contains the Tyk OSS API Gateway, the Tyk Dashboard is provided as a separate container and needs to be configured separately.

## Start the local containers

`docker-compose up`

Will run on 8081

## Set up a auth key

```
curl localhost:8081/tyk/keys -X POST --header "x-tyk-authorization: foo" -d '
{
  "quota_max": 0,
  "rate": 2,
  "per": 5,
  "org_id": "default",
  "meta_data":{
   "custom-key":"123"
},
  "access_rights": {
      "1": {
          "api_name": "Tyk Test API",
          "api_id": "1",
          "versions": [
              "Default"
          ],
          "allowed_urls": [],
          "limit": null,
          "allowance_scope": ""
      }
    }
}'

```

## Reload whenever you make a change

```
curl localhost:8081/tyk/reload --header "x-tyk-authorization: foo"
```

## Run a sample request:

(run in another terminal/ssh window; let the original one kick out the logging)

(use the api key you got back in the Authorization line)

```
curl 'localhost:8081/tyk-api-test/post' \
  -H 'sec-ch-ua: "Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"' \
  -H 'accept: */*' \
  -H 'x-amz-user-agent: aws-amplify/2.0.3' \
  -H 'Authorization: default9714673583bd4ee88b358501ae5e1b68' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36' \
  -H 'content-type: application/json' \
  -H 'origin: https://www.ourbranch.com' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: https://www.ourbranch.com/' \
  -H 'accept-language: en-US,en;q=0.9' \
  --data-binary $'{"operationName":null,"variables":{"address":"100 Beatrice Dr","city":"Dayton","state":"OH","zip":"45404","rep":"jemison","fname":"Kurt","lname":"Muldrew","isApartment":false,"dateOfBirth":null,"currentAutoCarrier":null,"currentAutoLimitBIPD":null,"continuousAutoCoverageYears":null,"driversLicenseState":null,"driversLicenseNumber":null,"insuranceInPast31Days":false,"home":{}},"query":"query ($address: String\u0021, $city: String\u0021, $state: String\u0021, $zip: String\u0021, $unit: String, $isApartment: Boolean, $fname: String\u0021, $lname: String\u0021, $email: AWSEmail, $phone: String, $leadSource: String, $rep: String\u0021, $priorAddress: AddressDetailsInput, $dateOfBirth: AWSDate, $currentAutoCarrier: String, $currentAutoLimitBIPD: String, $continuousAutoCoverageYears: Int, $driversLicenseState: String, $driversLicenseNumber: String, $insuranceInPast31Days: Boolean, $fromStaff: Boolean, $VIN: String, $home: HomeDetailsInput) {   offer: requestQuote(userInput: {address: $address, city: $city, state: $state, zip: $zip, unit: $unit, isApartment: $isApartment, fname: $fname, lname: $lname, email: $email, phone: $phone, leadSource: $leadSource, rep: $rep, priorAddress: $priorAddress, dateOfBirth: $dateOfBirth, currentAutoCarrier: $currentAutoCarrier, currentAutoLimitBIPD: $currentAutoLimitBIPD, insuranceInPast31Days: $insuranceInPast31Days, continuousAutoCoverageYears: $continuousAutoCoverageYears, driversLicenseState: $driversLicenseState, driversLicenseNumber: $driversLicenseNumber, fromStaff: $fromStaff, VIN: $VIN, home: $home}) {     ...OfferFragment     __typename   } }  fragment OfferFragment on Offer {   id   } "}'
```

## Bundle the code

from the dist/inject folder:

```
docker run \
--rm \
-v $(pwd):/cloudplugin \
--entrypoint "/bin/sh" -it \
tykio/tyk-gateway:v3.1.2 \
-c 'cd /cloudplugin; /opt/tyk-gateway/tyk bundle build -y'
```

## upload the code:

from the dist/inject folder:

You need an mserv.yaml that has the variables from the Tyk control panel. Will look something like:

```
endpoint: https://tiny-ruth-mgw.aws-use1.cloud-ara.tyk.io/mserv
token: verylongstringofstuff
```

```
mserv --config ./mserv.yaml push ./bundle.zip
```

## Based on:

Visit the [docs page](http://sedky.ca/tyk-gw-docker-dev-env/docs/gateway/overview) for a walkthrough on everything.

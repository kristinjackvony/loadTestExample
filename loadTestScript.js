import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 1,
  duration: "5s"
};

export function setup() {
  var url = "https://thinking-tester-contact-list.herokuapp.com/users/login"
  var payload = JSON.stringify({ "email": "test@fake.com", "password": "foobarfoo" })
  var params =  { headers: { "Content-Type": "application/json" } }
  let response = http.post(url, payload, params);
  let JSONResponse = JSON.parse(response.body)
  let token = JSONResponse.token
  return token
}

export default function(data) {
  var token = data
  var url = "https://thinking-tester-contact-list.herokuapp.com/contacts"
  var bearer = "Bearer " + token
  var params =  { headers: { "Authorization": bearer, "Content-Type": "application/json"} }

  let getResponse = http.get(url, params)
  check(getResponse, {
    "get contact list response status is 200": (r) => r.status == 200,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  });
  
  let postPayload = JSON.stringify({ firstName: "Prunella", lastName: "Prunewhip" })
  let postResponse = http.post(url, postPayload, params)
  check(postResponse, {
    "add contact response status is 201": (r) => r.status == 201,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  })
  let JSONResponse = JSON.parse(postResponse.body)
  let id = JSONResponse._id

  let contactUrl = url + "/" + id
  let getContactResponse = http.get(contactUrl, params)
  check(getContactResponse, {
    "get contact response status is 200": (r) => r.status == 200,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  });

  let putPayload = JSON.stringify({ firstName: "Joe", lastName: "Schmoe" })
  let putResponse = http.put(contactUrl, putPayload, params)
  check(putResponse, {
    "update contact response status is 200": (r) => r.status == 200,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  });

  let patchPayload = JSON.stringify({ firstName: "Kristin" })
  let patchResponse = http.patch(contactUrl, patchPayload, params)
  check(patchResponse, {
    "partial update contact response status is 200": (r) => r.status == 200,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  });

  let deleteResponse = http.del(contactUrl, null, params)
  check(deleteResponse, {
    "delete contact response status is 200": (r) => r.status == 200,
    "response transaction time is OK": (r) => r.timings.duration < 1000
  });
};
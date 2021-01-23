function simpleStringHash(str) {
  var hash = 0,
    i,
    chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// ---- Sample middleware creation by end-user -----
var graphQLInjectPreMiddlewarea = new TykJS.TykMiddleware.NewMiddleware({});

graphQLInjectPreMiddlewarea.NewProcessRequest(function (
  request,
  session,
  spec
) {
  // You can log to Tyk console output by calloing the built-in log() function:
  log("Running GraphQL Rewrite JSVM middleware");

  // Get the Key from Cache
  var thisSession = JSON.parse(
    TykGetKeyData(request.Headers.Authorization[0], spec.APIID)
  );
  var affinity =
    thisSession &&
    thisSession.meta_data &&
    thisSession.meta_data.tyk_user_fields &&
    thisSession.meta_data.tyk_user_fields["affinity"]
      ? thisSession.meta_data.tyk_user_fields["affinity"]
      : "BAD";
  var affinityChecksum = simpleStringHash(affinity);
  log("affinity: " + affinity);
  log("cs: " + affinityChecksum);

  // log(request.Body);

  // Grab the Body frm the HTTP request
  bodyObject = JSON.parse(request.Body);
  log("Request Before: " + JSON.stringify(bodyObject, null, 2));

  // Rewrite the Query
  log("query before: " + bodyObject.query);

  if (bodyObject.query) {
    var newQuery = bodyObject.query;
    var firstParen = newQuery.indexOf("(");
    if (firstParen >= 0) {
      firstParen += 1;
      newQuery =
        newQuery.substr(0, firstParen) +
        "$affinity: String, $affinityChecksum: String, " +
        newQuery.substr(firstParen);
      log("query after A: " + newQuery);
    }
    var rqPos = newQuery.indexOf("requestQuote(");
    console.log("rqPos: ", newQuery.slice(0, rqPos));
    if (rqPos >= 0) {
      rqPos += 13;
      console.log("rqPos2: ", newQuery.slice(0, rqPos));
      var newQuery =
        newQuery.substr(0, rqPos) +
        "affinity: $affinity, affinityChecksum: $affinityChecksum, " +
        newQuery.substr(rqPos);
      log("query after B: " + newQuery);
    }
    bodyObject.query = newQuery;
    log("query after C: " + newQuery);

    // Rewrite the Variable
    if (!bodyObject.variables) {
      bodyObject.variables = {};
    }
    bodyObject.variables.affinity = affinity;
    bodyObject.variables.affinityChecksum = affinityChecksum;

    // Override the body:
    log("Request After: " + JSON.stringify(bodyObject));
    request.Body = JSON.stringify(bodyObject);
  }

  // You MUST return both the request and session metadata
  return graphQLInjectPreMiddlewarea.ReturnData(request, {});
});

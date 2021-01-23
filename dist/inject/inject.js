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

  // Grab the Body frm the HTTP request
  bodyObject = JSON.parse(request.Body);

  // Rewrite the Query
  if (bodyObject.query) {
    var newQuery = bodyObject.query;
    var firstParen = newQuery.indexOf("(");
    if (firstParen >= 0) {
      firstParen += 1;
      newQuery =
        newQuery.substr(0, firstParen) +
        "$affinity: String, $affinityChecksum: String, " +
        newQuery.substr(firstParen);
    }
    var rqPos = newQuery.indexOf("requestQuote(");
    if (rqPos >= 0) {
      rqPos += 13;
      var newQuery =
        newQuery.substr(0, rqPos) +
        "affinity: $affinity, affinityChecksum: $affinityChecksum, " +
        newQuery.substr(rqPos);
    }
    bodyObject.query = newQuery;

    // Rewrite the Variable
    if (!bodyObject.variables) {
      bodyObject.variables = {};
    }
    bodyObject.variables.affinity = affinity;
    bodyObject.variables.affinityChecksum = affinityChecksum;

    // Override the body:
    request.Body = JSON.stringify(bodyObject);
  }

  // You MUST return both the request and session metadata
  return graphQLInjectPreMiddlewarea.ReturnData(request, {});
});

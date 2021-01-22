// ---- Sample middleware creation by end-user -----
var graphQLInjectPreMiddlewarea = new TykJS.TykMiddleware.NewMiddleware({});

graphQLInjectPreMiddlewarea.NewProcessRequest(function (
  request,
  session,
  spec
) {
  // You can log to Tyk console output by calloing the built-in log() function:
  log("Running GraphQL Rewrite JSVM middleware");

  log(request.Body);

  // Grab the Body frm the HTTP request
  bodyObject = JSON.parse(request.Body);
  log("Request Before: " + JSON.stringify(bodyObject));

  // Rewrite the Query
  log("query before: " + bodyObject.query);
  var newQuery =
    "query o($a: String){listEvents(customerId: $a)" +
    bodyObject.query.slice(20);
  log("query after: " + newQuery);
  bodyObject.query = newQuery;

  // log("session: " + JSON.stringify(session))
  // log("auth key in header: " + request.Headers.Authorization[0])
  // log("request context variables: " + JSON.stringify(spec))
  // log("portal-developer-id: " + thisSession.meta_data['tyk_developer_id'])

  // Rewrite the Variable
  // Get the Key from Cache
  var thisSession = JSON.parse(
    TykGetKeyData(request.Headers.Authorization[0], spec.APIID)
  );
  var customkeyValue = thisSession.meta_data.tyk_user_fields["my-custom-key"];
  log("Custom meta data field: " + customkeyValue);
  bodyObject.variables = { a: customkeyValue };

  // Override the body:
  // log("Request After: " + JSON.stringify(bodyObject))
  request.Body = JSON.stringify(bodyObject);

  // You MUST return both the request and session metadata
  return graphQLInjectPreMiddlewarea.ReturnData(request, {});
});

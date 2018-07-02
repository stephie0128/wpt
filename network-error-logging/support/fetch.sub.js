const reportID = "{{$id:uuid()}}";

function _monitoredDomain(domain) {
  if (domain == "www2") {
    return "{{hosts[alt][www2]}}"
  } else {
    return "{{hosts[alt][]}}"
  }
}

function _getNELResourceURL(domain, suffix) {
  return "https://" + _monitoredDomain(domain) +
    ":{{ports[https][0]}}/network-error-logging/support/" + suffix;
}

/*
 * Fetches a resource whose headers define a NEL policy.  We ensure that we
 * request the resource from a different origin than is used for the main test
 * case HTML file or for report uploads.  This minimizes the number of reports
 * that are generated for this policy.
 */

function getNELPolicyResourceURL(domain) {
  return _getNELResourceURL(domain, "pass.png?id="+reportID);
}

function fetchNELPolicyResource(domain) {
  const url = getNELPolicyResourceURL(domain);
  return fetch(url, {mode: "no-cors"});
}

/*
 * Fetches a resource whose headers define an include_subdomains NEL policy.
 */

function getNELSubdomainPolicyResourceURL(domain) {
  return _getNELResourceURL(domain, "subdomains-pass.png?id="+reportID);
}

function fetchNELSubdomainPolicyResource(domain) {
  const url = getNELSubdomainPolicyResourceURL(domain);
  return fetch(url, {mode: "no-cors"});
}

/*
 * Fetches a resource whose headers do NOT define a NEL policy.  This may or may
 * not generate a NEL report, depending on whether you've already successfully
 * requested a resource from the same origin that included a NEL policy.
 */

function getNELNoPolicyResourceURL(domain) {
  return _getNELResourceURL(domain, "no-policy-pass.png");
}

function fetchNELNoPolicyResource(domain) {
  const url = getNELNoPolicyResourceURL(domain);
  return fetch(url, {mode: "no-cors"});
}

/*
 * Fetches a resource that doesn't exist.  This may or may not generate a NEL
 * report, depending on whether you've already successfully requested a resource
 * from the same origin that included a NEL policy.
 */

function getNELMissingResourceURL(domain) {
  return _getNELResourceURL(domain, "nonexistent.png");
}

function fetchNELMissingResource(domain) {
  const url = getNELMissingResourceURL(domain);
  return fetch(url, {mode: "no-cors"});
}

/*
 * Returns whether all of the fields in obj1 also exist in obj2 with the same
 * values.  (Put another way, returns whether obj1 and obj2 are equal, ignoring
 * any extra fields in obj2.)
 */

function _isSubsetOf(obj1, obj2) {
  for (const prop in obj1) {
    if (typeof obj1[prop] === 'object') {
      if (typeof obj2[prop] !== 'object') {
        return false;
      }
      if (!_isSubsetOf(obj1[prop], obj2[prop])) {
        return false;
      }
    } else if (obj1[prop] != obj2[prop]) {
      return false;
    }
  }
  return true;
}

/*
 * Verifies that a report was uploaded that contains all of the fields in
 * expected.
 */

async function reportExists(expected) {
  var timeout =
    document.querySelector("meta[name=timeout][content=long]") ? 50 : 5;
  var reportLocation =
    "/network-error-logging/support/report.py?op=retrieve_report&timeout=" +
    timeout + "&reportID=" + reportID;
  const response = await fetch(reportLocation);
  const json = await response.json();
  for (const report of json) {
    if (_isSubsetOf(expected, report)) {
      return true;
    }
  }
  return false;
}

import { useEffect } from "react";

function Auth() {
  useEffect(() => {
    const script: HTMLScriptElement = document.createElement("script");

    script.src =
      "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    window.onload = function () {
      window.YaSendSuggestToken("http://localhost:5173", {
        kek: true,
      });
    };
  }, []);

  return <div></div>;
}

export default Auth;

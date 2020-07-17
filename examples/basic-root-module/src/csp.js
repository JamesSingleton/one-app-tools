import contentSecurityPolicyBuilder from 'content-security-policy-builder';
import ip from 'ip';

export default contentSecurityPolicyBuilder({
  directives: {
    reportUri: process.env.ONE_CLIENT_CSP_REPORTING_URL,
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", `${ip.address()}:3001`, 'localhost:3001'],
    imgSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", `${ip.address()}:3001`, 'localhost:3001'],
  },
});

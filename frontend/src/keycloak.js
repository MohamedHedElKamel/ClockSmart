import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'clocksmart',
  clientId: 'clocksmart-frontend',
});

export default keycloak;
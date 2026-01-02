#!/usr/bin/env node

const http = require('http');

const checkServer = (url, callback) => {
  http.get(url, (res) => {
    if (res.statusCode === 200 || res.statusCode === 400) {
      callback(true);
    } else {
      callback(false);
    }
  }).on('error', () => {
    callback(false);
  });
};

const waitForServers = () => {
  let clientReady = false;
  let serverReady = false;

  const checkAndOpen = () => {
    if (clientReady && serverReady) {
      console.log('Both servers ready, opening browser...');
      const { exec } = require('child_process');
      exec('open http://localhost:5173');
      process.exit(0);
    }
  };

  const checkClient = () => {
    checkServer('http://localhost:5173', (ready) => {
      if (ready && !clientReady) {
        console.log('Client ready');
        clientReady = true;
        checkAndOpen();
      } else if (!ready) {
        setTimeout(checkClient, 500);
      }
    });
  };

  const checkGraphQL = () => {
    checkServer('http://localhost:4000/graphql', (ready) => {
      if (ready && !serverReady) {
        console.log('Server ready');
        serverReady = true;
        checkAndOpen();
      } else if (!ready) {
        setTimeout(checkGraphQL, 500);
      }
    });
  };

  checkClient();
  checkGraphQL();
};

console.log('Waiting for servers to be ready...');
waitForServers();

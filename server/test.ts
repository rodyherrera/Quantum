import Docker from 'dockerode';

(async () => {
    const docker = new Docker();
    const container = docker.getContainer('quantum-container-development-HTTP_Server_Test_');
    const data = await container.inspect();
    const ipAddress = data.NetworkSettings.Networks['quantum-network-development-66f0f25a392748f51d7a9516-http-server-test-network'].IPAddress;
    console.log(ipAddress);
})();
const os = require("os");
const https = require("https");

const EmbededResponseService = require("../services/embededResponseService");

const Constants = require("../constants");

let lastCpuUsage;

const getDiscordApiLatencyInMs = async (client) => {
    const start = Date.now();

    const options = {
        hostname: 'discord.com',
        path: '/api/v10/users/@me',
        method: 'GET',
        headers: {
            Authorization: `Bot ${client.token}`,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve(Date.now() - start));
        });
        req.on('error', e => reject(e));
        req.end();
    });
}

module.exports = {
    execute: async (client) => {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = lastCpuUsage ? process.cpuUsage(lastCpuUsage) : process.cpuUsage();
        lastCpuUsage = cpuUsage;

        const totalMemory = os.freemem() + memoryUsage.rss;
        const metrics = {
            usedMemory: memoryUsage.rss,
            totalMemory,
            memoryPercentage: memoryUsage.rss / totalMemory,
            cpuPercentage: (cpuUsage.user + cpuUsage.system) / (Constants.MONITORING_INTERVAL_IN_SECONDS * 1e6),
            discordWsLatencyMs: client.ws.ping,
            discordApiLatencyMs: await getDiscordApiLatencyInMs(client)
        };

        const embed = EmbededResponseService.getPerformanceMonitorView(metrics);
        const channel = client.channels.cache.get(Constants.PERFORMANCE_MONITOR_CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
        }
    }
}
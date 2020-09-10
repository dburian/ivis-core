'use strict';

const si = require('systeminformation');

class ServerMonitor {
    constructor() {
        this.status = {
            isPlaying: false,
            position: 0,
            data: {
                cpu_load: {
                    load: 0,
                    user: 0,
                    system: 0,
                },
                mem_status: {
                    total: 0,
                    free: 0,
                    used: 0,
                },
                disk_load: {
                    readIOPerSec: 0,
                    writeIOPerSec: 0,
                    totalIOPerSec: 0,
                }
            },
        };

        this.refreshStatsBound = this.refreshStats.bind(this);
    }

    static async getCPULoad() {
        const loadInfo = await si.currentLoad();

        return {
            load: loadInfo.currentload,
            user: loadInfo.currentload_user,
            system: loadInfo.currentload_system,
        };
    }

    static async getMemStatus() {
        const memInfo = await si.mem();

        return {
            total: memInfo.total,
            free: memInfo.free,
            used: memInfo.used,
        };
    }

    static async getDiskLoad() {
        const diskStat = await si.disksIO();

        return {
            readIOPerSec: diskStat.rIO_sec,
            writeIOPerSec: diskStat.wIO_sec,
            totalIOPerSec: diskStat.tIO_sec,
        };
    }

    async refreshStats() {
        const cpu_load = await ServerMonitor.getCPULoad();

        const mem_status = await ServerMonitor.getMemStatus();

        const disk_load = await ServerMonitor.getDiskLoad();

        this.updateStatus({data: { cpu_load, mem_status, disk_load}});
    }

    updateStatus(newStatus) {
        Object.assign(this.status, newStatus);
        this.status.position = Date.now();
    }


    startMonitoring() {
        this.refreshStats();
        this.refreshInterval = setInterval(this.refreshStatsBound, 100);
    }

    stopMonitoring() {
        clearInterval(this.refreshInterval);
    }

    getStatus() {
        return {...this.status};
    }

    play() {
        if (this.status.isPlaying) return;

        this.updateStatus({isPlaying: true});
        this.startMonitoring();
    }

    pause() {
        this.updateStatus({isPlaying: false});
        this.stopMonitoring();
    }
}

module.exports.create = function create() {
    return new ServerMonitor();
}

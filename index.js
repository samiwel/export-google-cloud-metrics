const {promises: fs} = require("fs");
const mkdirp = require("mkdirp");
const monitoring = require("@google-cloud/monitoring");
const grpc = require("grpc");
const metricDescriptors = require("./metricDescriptors.json");
const projects = require("./projects.json")

const startOfDay = d => new Date(d).setHours(0,0,0, 0);
const endOfDay = d => new Date(d).setHours(23, 59,59,999);
const millisToSeconds = v => Math.floor(v / 1000);

const exportGoogleCloudMetrics = async ({startDate = Date.now(), endDate = Date.now()}) => {
    const timestamp = Date.now();

    projects.map(async project => {
        const client = new monitoring.MetricServiceClient({projectId: project, grpc});
        metricDescriptors.map(async metricDescriptor => {
            console.log(`|-- Gathering timeSeries for metric type ${metricDescriptor}`);
            try {
                const [results] = await client.listTimeSeries({
                    name: client.projectPath(project),
                    filter: `metric.type="${metricDescriptor}"`,
                    interval: {
                        startTime: {
                            seconds: millisToSeconds(startOfDay(startDate))
                        },
                        endTime: {
                            seconds: millisToSeconds(endOfDay(endDate))
                        },
                    },
                    aggregation: {
                        alignmentPeriod: {
                            seconds: 300
                        }
                    }
                });

                if (results.length === 0) {
                    return;
                }

                const parts = metricDescriptor.split("/");
                const path = `${timestamp}/${project}/${parts.slice(0, parts.length - 1).join("/")}`;
                await mkdirp(path);

                await fs.writeFile(`${path}/${parts[parts.length - 1]}.json`, JSON.stringify(results));
            } catch (e) {
                console.error(`Failed to get timeSeries data for ${metricDescriptor}`)
                console.error(e);
            }

        });
    })
};

exportGoogleCloudMetrics();

module.exports = {
    exportGoogleCloudMetrics,
}
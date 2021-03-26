const { promises: fs } = require("fs");
const mkdirp = require("mkdirp");
const monitoring = require("@google-cloud/monitoring");
const grpc = require("grpc");
const metricDescriptors = require("./metricDescriptors.json");
const projects = require("./projects.json");

const millisToSeconds = (v) => Math.floor(v / 1000);

const ONE_MINUTE_IN_SECONDS = 60;
const FIVE_MINUTES_IN_SECONDS = 5 * ONE_MINUTE_IN_SECONDS;

const exportGoogleCloudMetrics = async ({ startDate, endDate }) => {
  const timestamp = Date.now();

  projects.map(async (project) => {
    const client = new monitoring.MetricServiceClient({
      projectId: project,
      grpc,
    });
    metricDescriptors.map(async ({ type: metricDescriptor }) => {
      console.log(
        `|-- Gathering timeSeries for metric type ${metricDescriptor}`
      );
      try {
        const [results] = await client.listTimeSeries({
          name: client.projectPath(project),
          filter: `metric.type="${metricDescriptor}"`,
          interval: {
            startTime: {
              seconds: millisToSeconds(startDate),
            },
            endTime: {
              seconds: millisToSeconds(endDate),
            },
          },
          aggregation: {
            alignmentPeriod: {
              seconds: FIVE_MINUTES_IN_SECONDS,
            },
          },
        });

        if (results.length === 0) {
          return;
        }

        const parts = metricDescriptor.split("/");
        const path = `${timestamp}/${project}/${parts
          .slice(0, parts.length - 1)
          .join("/")}`;
        await mkdirp(path);

        await fs.writeFile(
          `${path}/${parts[parts.length - 1]}.json`,
          JSON.stringify(results)
        );
      } catch (e) {
        console.error(`Failed to get timeSeries data for ${metricDescriptor}`);
        console.error(e);
      }
    });
  });
};

(async () => {
  const now = Date.now();
  const SECONDS_IN_ONE_DAY = 86400;
  const SECONDS_IN_ONE_WEEK = 7 * SECONDS_IN_ONE_DAY;
  const SIX_WEEKS_IN_SECONDS = 6 * SECONDS_IN_ONE_WEEK;
  await exportGoogleCloudMetrics({
    startDate: now - SIX_WEEKS_IN_SECONDS * 1000,
    endDate: now,
  });
})();

const { promises: fs } = require("fs");
const mkdirp = require("mkdirp");
const monitoring = require("@google-cloud/monitoring");
const grpc = require("grpc");
const metricDescriptors = require("./metricDescriptors.json");
const projects = require("./projects.json");

const millisToSeconds = (v) => Math.floor(v / 1000);

const ONE_MINUTE_IN_SECONDS = 60;
const FIVE_MINUTES_IN_SECONDS = 5 * ONE_MINUTE_IN_SECONDS;

function parseISOString(s) {
  const b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

const exportGoogleCloudMetrics = async ({ startDate, endDate }) => {
  const timestamp = Date.now();

  let client;

  for (let project of projects) {
    client = new monitoring.MetricServiceClient({
      projectId: project,
      grpc,
    });

    for (let metricDescriptor of metricDescriptors) {
      console.log(
        `Gathering timeSeries for metric type ${metricDescriptor}...`
      );

      try {
        const [results] = await client.listTimeSeries({
          name: client.projectPath(project),
          filter: `metric.type="${metricDescriptor}"`,
          interval: {
            startTime: {
              seconds: millisToSeconds(startDate.getTime()),
            },
            endTime: {
              seconds: millisToSeconds(endDate.getTime()),
            },
          },
          aggregation: {
            alignmentPeriod: {
              seconds: FIVE_MINUTES_IN_SECONDS,
            },
          },
        });

        if (results.length === 0) {
          continue;
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
    }
  }
};

(async () => {
  const now = new Date();

  let startDate;
  let endDate;

  if (process.argv.length > 2) {
    startDate = parseISOString(process.argv[2]);
    if (process.argv.length > 3) {
      endDate = parseISOString(process.argv[3]);
    }

    if (startDate && endDate && startDate > endDate) {
      console.error(
        `Start date must be before end date. ${JSON.stringify({
          startDate,
          endDate,
        })}`
      );
      process.exit(1);
    }
  }

  await exportGoogleCloudMetrics({
    startDate: startDate || now,
    endDate: endDate || startDate || now,
  });
})();

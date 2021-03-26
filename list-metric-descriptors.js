const monitoring = require("@google-cloud/monitoring");
const { promises: fs } = require("fs");

const listMetricDescriptors = async ({ project }) => {
  const client = new monitoring.MetricServiceClient({
    projectId: project,
  });

  const [metricDescriptors] = await client.listMetricDescriptors({
    name: `projects/${project}`,
  });

  const data = metricDescriptors.map(
    ({ type, description, displayName, metricKind, valueType }) => ({
      type,
      description,
      displayName,
      metricKind,
      valueType,
    })
  );

  await fs.writeFile("metricDescriptors.json", JSON.stringify(data, null, 2));

  console.log(
    `Listed ${data.length} metric descriptors for project ${project}.`
  );
};

(async () => {
  if (process.argv.length !== 3) {
    console.error(`Usage:\n\tnode list-metric-descriptors.js <gcp-project-id>`);
    process.exit(1);
  }

  const project = process.argv[2];
  await listMetricDescriptors({
    project,
  });
})();

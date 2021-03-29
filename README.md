# export-google-cloud-metrics

A script which can be used to export metrics from the Google Cloud API to files on disk.

## Getting started

1. Ensure you have a recent NodeJS environment installed. (Node 10 and above should be fine)

1. Install dependencies with Yarn.
    ```
    yarn install
    ```

1. Edit the [metric descriptors JSON file](./metricDescriptors.json) to include only the metrics you care about exporting.
1. Edit the [projects JSON file](./projects.json) to include only the projects that you care about exporting.

1. Run the export script with
    ```
    yarn start <startDate> <endDate>
    ```

    The start and end dates should be in ISO format e.g. `2021-03-29T08:00:00.000Z`

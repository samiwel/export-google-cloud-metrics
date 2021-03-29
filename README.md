# export-google-cloud-metrics

A script which can be used to export metrics from the Google Cloud API to files on disk.

## Getting started

Ensure you have a recent NodeJS environment installed. (Node 10 and above should be fine)

Install dependencies with Yarn.
```
yarn install
```

Run the export script with
```
yarn start <startDate> <endDate>
```

The start and end dates should be in ISO format e.g. `2021-03-29T08:00:00.000Z`

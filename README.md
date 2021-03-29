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
yarn start
```

The script defaults to getting the metrics for the current date. 

This can be customised by passing in additonal arguments for the start and end dates on the command line.

```
yarn start <startDate> <endDate>
```

The start and end dates should be in ISO format e.g. 2021-03-29T08:00.000Z

If no end date is specified then the script will extract metrics for the start date only.
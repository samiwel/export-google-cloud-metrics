# export-stackdriver-metrics

A script which can be used to export metrics from the Google Cloud API to files on disk.

## Getting started

Install dependencies with `yarn install`

Run the script with `yarn start`

The script defaults to getting the metrics for the current date. This can be customised by importing the `exportStackdriverMetrics` function into a new module and specifying the startDate and endDate option.
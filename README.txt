Aero S v2.1.12
Reset regression fix. Rebased on v2.1.10 and uses a deliberately minimal Clear data / Clear instance path: direct clearing of the dataset list and dependent selectors, explicit clearing of the relevant canvases, and simple state-variable reset. The broad resetAnalysisVisualState/updateUI refresh chain is not called from these handlers.

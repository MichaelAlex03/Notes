import { registerOTel } from '@vercel/otel'

// This just runs once when server is created
export async function register() {

    if (process.env.NEXT_RUNTIME === "nodejs") {
        // These break on edge runtime so need to check runtime
        const { PinoInstrumentation } = await import("@opentelemetry/instrumentation-pino")
        const { OTLPLogExporter } = await import("@opentelemetry/exporter-logs-otlp-http")
        const { BatchLogRecordProcessor } = await import("@opentelemetry/sdk-logs")

        registerOTel({
            serviceName: "notes-app",
            traceSampler: 'always_on',
            instrumentations: ["auto", new PinoInstrumentation()], // PinoInstrumentation handles getting active span and traceID and adding it to log and also sending it to LoggerProvider
            logRecordProcessors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() })]
        })
    }

}
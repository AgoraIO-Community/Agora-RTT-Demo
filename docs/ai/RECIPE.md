# Real-Time Transcription Demo

## Overview

Add real-time transcription text alongside an Agora RTC session so participants can follow spoken audio as captions.

Repository: [AgoraIO-Community/Agora-RTT-Demo](https://github.com/AgoraIO-Community/Agora-RTT-Demo)

## Prerequisites and Setup

1. Work in `web/` using Node.js 18+ as documented by its README.
2. Enable the project's required RTM and RTT services. Create the local `.env` with `VITE_AGORA_APP_ID` and `VITE_AGORA_APP_CERTIFICATE` for isolated testing.
3. Run `npm install`, then `npm run dev` in `web/`. Use `npm run build` to check the web bundle.
4. Open the app with a second client in the same configured channel and exercise transcription.

## What To Check

- Verify spoken audio produces transcript updates for the correct participant.
- Exercise language selection and service stop/restart.
- Leave and confirm transcription and microphone capture stop.

## Integration Notes

The Vite certificate variable is exposed in the client bundle. This is a test-only credential flow; production task control and token generation belong on a trusted backend. Service entitlement must be configured before runtime testing.

Keep App Certificates, customer secrets and privileged token generation on a trusted backend for production. Use only your own test credentials while configuring historical demos; do not commit them. Preserve the sample's existing dependency versions and lifecycle until a separate migration is tested.

## Source References

- [web/README.md](../../web/README.md)
- [web/package.json](../../web/package.json)

## Validation Status

This recipe was checked against the repository's source and setup documents. The platform build and live service/device flow have not been run as part of this documentation change. Complete the checks above in an environment with the required SDKs, hardware and service access before treating it as a validated deployment.

## Implementation Prompt

```text
You are working in AgoraIO-Community/Agora-RTT-Demo. Use docs/ai/RECIPE.md and its linked source files to adapt the Real-Time Transcription Demo reference to this project.

Start by inspecting the actual sample directory and configuration described above. Resolve its listed missing prerequisites before claiming it is runnable. Preserve the existing architecture and compatible dependency versions. Implement the recipe's feature-specific flow, permissions and resource cleanup. Use a trusted backend for privileged credentials and tokens in production.

Run the repository-specific build or launch flow, then perform each What To Check item. Report the commands run, the observed results and anything blocked by service access, hardware or incomplete sample code. Do not claim live validation from a documentation or catalog build alone.
```

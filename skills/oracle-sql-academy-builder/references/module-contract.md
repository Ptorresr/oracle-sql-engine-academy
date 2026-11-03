# Module contract

Required module sections:
- Definition (what is it?)
- Mechanism (how does it work?)
- Purpose (why use it?)
- Three realistic use cases (inputs, query, expected outputs)
- Interactive timeline (Play/Pause/Step/Reset/speed)
- Developer / Execution Plan / Internals synchronized views
- At least one accessible SVG infographic
- SQL copy and validation notes
- Quiz and DBA caveats

Data contract for each event:
`{step, type, source, target, rowIds, blockIds, label, illustrativeMetrics}`.

Prefer small synthetic datasets, visible NULL behavior, deterministic execution and no misleading depiction of physical data movement. Annotate all invented performance metrics. Validate on mobile and with keyboard-only navigation.

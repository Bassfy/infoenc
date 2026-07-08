import { Injectable, Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";

/**
 * LLM gateway (Phase 2 doc 03 §5, doc 07 P1) — the ONE internal client wrapping Claude. Every
 * automation LLM call goes through here so model choice, token accounting, and the data-boundary
 * discipline are enforced in one place, not scattered across workflows.
 *
 * Model: claude-opus-4-8 with adaptive thinking (the current most capable Opus tier). Effort is
 * per-call. The gateway NEVER fabricates a data boundary — callers pass an already-bounded context
 * string (built by a workflow-specific context builder that loaded only its own scope, e.g. one
 * engagement). The gateway has no database access; it cannot widen the caller's scope.
 */
export interface LlmResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class LlmGateway {
  private readonly log = new Logger(LlmGateway.name);
  private readonly client = new Anthropic(); // resolves ANTHROPIC_API_KEY / profile from env
  private static readonly MODEL = "claude-opus-4-8";

  /**
   * A single completion. Uses streaming under the hood so large report generations don't hit HTTP
   * timeouts (Phase-8 reports can be long), and returns the assembled text + token usage for the
   * automation-run trace.
   */
  async complete(params: {
    system: string;
    /** Fully-built, scope-bounded context. The gateway does not fetch anything. */
    context: string;
    instruction: string;
    effort?: "low" | "medium" | "high" | "xhigh" | "max";
    maxTokens?: number;
  }): Promise<LlmResult> {
    const stream = this.client.messages.stream({
      model: LlmGateway.MODEL,
      max_tokens: params.maxTokens ?? 32_000,
      thinking: { type: "adaptive" },
      output_config: { effort: params.effort ?? "high" },
      system: params.system,
      messages: [
        {
          role: "user",
          content: `${params.context}\n\n---\n\n${params.instruction}`,
        },
      ],
    });

    const message = await stream.finalMessage();
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (message.stop_reason === "refusal") {
      this.log.warn(`LLM refused a request (${JSON.stringify(message.stop_details)})`);
      throw new Error("LLM_REFUSED");
    }

    return {
      text,
      model: message.model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    };
  }
}

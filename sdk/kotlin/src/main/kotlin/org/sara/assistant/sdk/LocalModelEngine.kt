package org.sara.assistant.sdk

enum class EngineState {
    UNLOADED,
    LOADING,
    READY,
    BUSY,
    ERROR
}

data class AssistantRequest(
    val text: String,
    val locale: String,
    val availableSkills: Set<String>,
    val availableTools: Set<String>
)

/**
 * Model-neutral boundary for local inference adapters.
 *
 * Implementations must not execute tools. They return a proposal to trusted host code,
 * which applies schema, capability, effect, and confirmation policy.
 */
interface LocalModelEngine : AutoCloseable {
    val state: EngineState

    suspend fun load(modelPackage: String, expectedSha256: String)

    suspend fun propose(request: AssistantRequest): ToolProposal?

    suspend fun respondTo(result: ToolResult): String

    suspend fun cancel()
}

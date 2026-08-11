package org.sara.assistant.sdk

import java.util.UUID

enum class ToolStatus {
    SUCCEEDED,
    FAILED,
    CANCELLED,
    TIMED_OUT
}

data class ToolProposal(
    val tool: String,
    val arguments: Map<String, Any?> = emptyMap()
)

data class ToolError(
    val code: String,
    val message: String
)

data class ToolMeta(
    val requestId: String,
    val toolVersion: String,
    val source: String,
    val durationMs: Long
)

data class ToolResult(
    val ok: Boolean,
    val status: ToolStatus,
    val data: Map<String, Any?>? = null,
    val error: ToolError? = null,
    val meta: ToolMeta
) {
    init {
        require(ok == (data != null)) { "Successful results require data and failed results must not include it." }
        require(ok == (error == null)) { "Failed results require an error and successful results must not include it." }
    }
}

fun interface ToolTransport {
    suspend fun invoke(proposal: ToolProposal, requestId: String): ToolResult
}

class SaraAssistantClient(
    private val transport: ToolTransport
) {
    suspend fun invoke(tool: String, arguments: Map<String, Any?> = emptyMap()): ToolResult {
        require(TOOL_NAME.matches(tool)) { "tool must be a published tool name" }
        val requestId = UUID.randomUUID().toString()
        return transport.invoke(ToolProposal(tool, arguments.toMap()), requestId)
    }

    private companion object {
        val TOOL_NAME = Regex("^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$")
    }
}

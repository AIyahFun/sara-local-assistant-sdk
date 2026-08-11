package org.sara.assistant.sdk

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.coroutines.startCoroutine

class ContractsTest {
    @Test
    fun successfulResultRequiresData() {
        assertFailsWith<IllegalArgumentException> {
            ToolResult(
                ok = true,
                status = ToolStatus.SUCCEEDED,
                meta = ToolMeta("request-123", "1.0.0", "synthetic-fixture", 1)
            )
        }
    }

    @Test
    fun transportReceivesOpaqueRequestId() = runSuspend {
        val client = SaraAssistantClient { proposal, requestId ->
            assertEquals("system.get_context", proposal.tool)
            ToolResult(
                ok = true,
                status = ToolStatus.SUCCEEDED,
                data = mapOf("synthetic" to true),
                meta = ToolMeta(requestId, "1.0.0", "synthetic-fixture", 1)
            )
        }

        val result = client.invoke("system.get_context")
        assertEquals(true, result.ok)
        assertEquals(36, result.meta.requestId.length)
    }

    private fun runSuspend(block: suspend () -> Unit) {
        var failure: Throwable? = null
        block.startCoroutine(object : kotlin.coroutines.Continuation<Unit> {
            override val context = kotlin.coroutines.EmptyCoroutineContext
            override fun resumeWith(result: Result<Unit>) {
                failure = result.exceptionOrNull()
            }
        })
        failure?.let { throw it }
    }
}

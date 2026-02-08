package com.openclaw.seeker

import org.json.JSONArray
import org.json.JSONObject

/**
 * Executes TASK jobs locally on the device.
 */
object TaskExecutor {

    fun execute(taskType: String, input: String): JSONObject {
        return when (taskType) {
            "summarize" -> summarize(input)
            "classify" -> classify(input)
            "extract_json" -> extractJson(input)
            else -> JSONObject().put("error", "Unknown task_type: $taskType")
        }
    }

    private fun summarize(input: String): JSONObject {
        val words = input.trim().split("\\s+".toRegex())
        val truncated = if (input.length > 200) input.take(200) + "..." else input
        return JSONObject().apply {
            put("summary", truncated)
            put("word_count", words.size)
        }
    }

    private fun classify(input: String): JSONObject {
        val lower = input.lowercase()
        val positive = listOf("good", "great", "excellent", "amazing", "love", "happy")
        val negative = listOf("bad", "terrible", "awful", "hate", "worst", "horrible")

        var score = 0
        positive.forEach { if (lower.contains(it)) score++ }
        negative.forEach { if (lower.contains(it)) score-- }

        val sentiment = when {
            score > 0 -> "positive"
            score < 0 -> "negative"
            else -> "neutral"
        }
        return JSONObject().apply {
            put("sentiment", sentiment)
            put("confidence", minOf(1.0, Math.abs(score) * 0.2 + 0.3))
        }
    }

    private fun extractJson(input: String): JSONObject {
        val pattern = "\\{[^{}]*(?:\\{[^{}]*}[^{}]*)*}".toRegex()
        val matches = pattern.findAll(input)
        val extracted = JSONArray()

        for (match in matches) {
            try {
                extracted.put(JSONObject(match.value))
            } catch (e: Exception) {
                // skip invalid JSON
            }
        }

        return JSONObject().apply {
            put("extracted", extracted)
            put("count", extracted.length())
        }
    }
}

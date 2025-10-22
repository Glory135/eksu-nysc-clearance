import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from '@ai-sdk/google';

export interface PassportValidationResult {
  isValid: boolean
  errors: string[]
  details: {
    hasWhiteBackground: boolean
    faceCount: number
    isFullyClothed: boolean
    isFaceVisible: boolean
    isPortraitOrientation: boolean
    hasInappropriateContent: boolean
  }
}

export async function validatePassportPhoto(imageUrl: string): Promise<PassportValidationResult> {
  try {
    const prompt = `You are a passport photo validation system for EKSU NYSC Clearance. Analyze this image and provide a JSON response with the following structure:

{
  "hasWhiteBackground": boolean (true if background is plain white or very light colored),
  "faceCount": number (count of human faces detected),
  "isFullyClothed": boolean (true if person is wearing appropriate clothing covering shoulders and chest),
  "isFaceVisible": boolean (true if full face is clearly visible and centered),
  "isPortraitOrientation": boolean (true if image is in portrait orientation),
  "hasInappropriateContent": boolean (true if image contains explicit, inappropriate, or unprofessional content)
}

Be strict with validation. The photo must meet professional passport standards.`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageUrl },
          ],
        },
      ],
    })

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid AI response format")
    }

    const details = JSON.parse(jsonMatch[0])
    const errors: string[] = []

    // Check each validation criterion
    if (!details.hasWhiteBackground) {
      errors.push("Background must be plain white or very light colored")
    }

    if (details.faceCount === 0) {
      errors.push("No face detected in the image")
    } else if (details.faceCount > 1) {
      errors.push("Multiple people detected. Only one person should appear in the photo")
    }

    if (!details.isFullyClothed) {
      errors.push("You must be fully clothed with appropriate attire covering shoulders and chest")
    }

    if (!details.isFaceVisible) {
      errors.push("Your full face must be clearly visible and centered")
    }

    if (!details.isPortraitOrientation) {
      errors.push("Photo must be in portrait orientation (vertical)")
    }

    if (details.hasInappropriateContent) {
      errors.push("Image contains inappropriate or unprofessional content")
    }

    return {
      isValid: errors.length === 0,
      errors,
      details,
    }
  } catch (error) {
    console.error("[v0] Passport validation error:", error)
    throw new Error("Failed to validate passport photo. Please try again.")
  }
}

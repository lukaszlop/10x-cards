-- Add confidence_score column to generations table
ALTER TABLE generations
ADD COLUMN confidence_score DECIMAL(3,2) NOT NULL DEFAULT 1.0
CHECK (confidence_score BETWEEN 0 AND 1);

-- Add index for potential analytics queries
CREATE INDEX idx_generations_confidence_score ON generations(confidence_score);

-- Comment on the column to document its purpose
COMMENT ON COLUMN generations.confidence_score IS 'A value between 0 and 1 returned by the LLM API indicating how confident the model is about its generated flashcards. Higher values indicate greater confidence.';

-- Remove the default value after initial migration
ALTER TABLE generations ALTER COLUMN confidence_score DROP DEFAULT;
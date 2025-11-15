import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    acceptance: { type: String },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stories: [StorySchema],
    status: { type: String, enum: ["active", "archived"], default: "active" },
    // Si es público, cualquiera puede ver la página en tiempo real
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual progress percentage computed from stories
ProjectSchema.virtual("progress").get(function () {
  if (!this.stories || this.stories.length === 0) return 0;
  const done = this.stories.filter((s) => s.status === "done").length;
  return Math.round((done / this.stories.length) * 100);
});

const Project = mongoose.model("Project", ProjectSchema);
export default Project;

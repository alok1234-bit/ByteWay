import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, ImageOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PhotoPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

const INITIAL_PHOTOS: PhotoPost[] = [
  {
    id: "1",
    title: "ByteWay Launch Event",
    description:
      "A snapshot from our incredible product launch event at the tech summit.",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    createdAt: new Date("2026-02-15").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  },
  {
    id: "2",
    title: "Team Building Day",
    description: "Our amazing team enjoying a productive offsite retreat.",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
    createdAt: new Date("2026-01-28").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  },
];

export default function PhotosPanel() {
  const [photos, setPhotos] = useState<PhotoPost[]>(INITIAL_PHOTOS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.imageUrl.trim()) errs.imageUrl = "Image URL is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newPhoto: PhotoPost = {
      id: Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setForm({ title: "", description: "", imageUrl: "" });
    setErrors({});
    setIsDialogOpen(false);
    toast.success("Photo added successfully");
  };

  const handleDelete = (id: string, title: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success(`"${title}" removed`);
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-chart-1" />
          Photo Posts
        </h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-chart-1 to-primary hover:opacity-90 text-white"
              data-ocid="photos.add_button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Photo</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="photo-title">Title *</Label>
                <Input
                  id="photo-title"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder="Enter photo title"
                  data-ocid="photos.title.input"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="photo-description">Description *</Label>
                <Textarea
                  id="photo-description"
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    setErrors({ ...errors, description: "" });
                  }}
                  placeholder="Describe this photo..."
                  rows={3}
                  data-ocid="photos.description.input"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <Label htmlFor="photo-url">Image URL *</Label>
                <Input
                  id="photo-url"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm({ ...form, imageUrl: e.target.value });
                    setErrors({ ...errors, imageUrl: "" });
                  }}
                  placeholder="https://example.com/photo.jpg"
                  data-ocid="photos.imageurl.input"
                />
                {errors.imageUrl && (
                  <p className="text-xs text-destructive">{errors.imageUrl}</p>
                )}
              </div>

              {/* Preview */}
              {form.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-border/60 h-40 bg-muted">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setErrors({});
                    setForm({ title: "", description: "", imageUrl: "" });
                  }}
                  data-ocid="photos.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-chart-1 to-primary hover:opacity-90 text-white"
                  data-ocid="photos.submit_button"
                >
                  Add Photo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border border-dashed border-border/60 bg-muted/20"
          data-ocid="photos.empty_state"
        >
          <ImageOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No photos yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Add your first photo to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <Card
              key={photo.id}
              className="group overflow-hidden border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
              data-ocid={`photos.item.${index + 1}`}
            >
              {/* Image */}
              <div className="relative h-44 bg-muted overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-muted-foreground/40"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
                    }
                  }}
                />
                {/* Delete overlay button */}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id, photo.title)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive shadow-sm"
                  aria-label={`Delete ${photo.title}`}
                  data-ocid={`photos.delete_button.${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                  {photo.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {photo.description}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-3 border-t border-border/40 pt-2">
                  {photo.createdAt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

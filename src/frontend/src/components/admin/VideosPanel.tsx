import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
  VideoOff,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFileToStorage } from "../../hooks/useFileUpload";
import {
  useCreateVideo,
  useDeleteVideo,
  useGetAllVideos,
  useUpdateVideo,
} from "../../hooks/useVideos";
import type { VideoPost } from "../../types/video";

type VideoFormState = {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
};

const emptyForm: VideoFormState = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
};

function formatDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VideosPanel() {
  const { data: videos, isLoading } = useGetAllVideos();
  const createMutation = useCreateVideo();
  const updateMutation = useUpdateVideo();
  const deleteMutation = useDeleteVideo();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newForm, setNewForm] = useState<VideoFormState>(emptyForm);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(
    null,
  );
  const [thumbUploadProgress, setThumbUploadProgress] = useState<number | null>(
    null,
  );
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const [editingVideo, setEditingVideo] = useState<VideoPost | null>(null);
  const [editForm, setEditForm] = useState<VideoFormState>(emptyForm);
  const [editVideoProgress, setEditVideoProgress] = useState<number | null>(
    null,
  );
  const [editThumbProgress, setEditThumbProgress] = useState<number | null>(
    null,
  );
  const [isEditUploadingVideo, setIsEditUploadingVideo] = useState(false);
  const [isEditUploadingThumb, setIsEditUploadingThumb] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const editVideoFileRef = useRef<HTMLInputElement>(null);
  const editThumbFileRef = useRef<HTMLInputElement>(null);

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (patch: Partial<VideoFormState>) => void,
    setProgress: (v: number | null) => void,
    setUploading: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFileToStorage(file, (pct) => setProgress(pct));
      setter({ videoUrl: url });
      toast.success("Video uploaded!");
    } catch (err) {
      toast.error("Video upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleThumbFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (patch: Partial<VideoFormState>) => void,
    setProgress: (v: number | null) => void,
    setUploading: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFileToStorage(file, (pct) => setProgress(pct));
      setter({ thumbnailUrl: url });
      toast.success("Thumbnail uploaded!");
    } catch (err) {
      toast.error("Thumbnail upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title || !newForm.videoUrl) {
      toast.error("Title and video are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newForm.title,
        description: newForm.description,
        videoUrl: newForm.videoUrl,
        thumbnailUrl: newForm.thumbnailUrl || undefined,
      });
      toast.success("Video added successfully!");
      setIsCreateOpen(false);
      setNewForm(emptyForm);
    } catch (err) {
      toast.error("Failed to add video");
      console.error(err);
    }
  };

  const openEdit = (video: VideoPost) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl ?? "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    if (!editForm.title || !editForm.videoUrl) {
      toast.error("Title and video are required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editingVideo.id,
        input: {
          title: editForm.title,
          description: editForm.description,
          videoUrl: editForm.videoUrl,
          thumbnailUrl: editForm.thumbnailUrl || undefined,
        },
      });
      toast.success("Video updated!");
      setEditingVideo(null);
    } catch (err) {
      toast.error("Failed to update video");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Video deleted");
      setDeletingId(null);
    } catch (err) {
      toast.error("Failed to delete video");
      console.error(err);
    }
  };

  const renderVideoFormFields = (
    form: VideoFormState,
    onChange: (patch: Partial<VideoFormState>) => void,
    idPrefix: string,
    videoFileInputRef: React.RefObject<HTMLInputElement | null>,
    thumbFileInputRef: React.RefObject<HTMLInputElement | null>,
    uploadingVideo: boolean,
    uploadingThumb: boolean,
    videoProgress: number | null,
    thumbProgress: number | null,
    onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onThumbChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Video title"
          data-ocid="videos.input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-desc`}>Description</Label>
        <Textarea
          id={`${idPrefix}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What is this video about?"
          rows={3}
          data-ocid="videos.textarea"
        />
      </div>

      {/* Video File Upload */}
      <div className="space-y-2">
        <Label>
          Video File <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${idPrefix}-video-file`}
            className="flex items-center gap-3 border border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            data-ocid="videos.dropzone"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              {uploadingVideo ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {form.videoUrl ? (
                <p className="text-sm font-medium text-green-600 truncate">
                  ✓ Video uploaded
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {uploadingVideo ? "Uploading..." : "Click to upload video"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                MP4, WebM, MOV, AVI
              </p>
            </div>
            <input
              ref={videoFileInputRef}
              id={`${idPrefix}-video-file`}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onVideoChange}
              data-ocid="videos.upload_button"
            />
          </label>
          {videoProgress !== null && (
            <Progress value={videoProgress} className="h-1.5" />
          )}
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label>Thumbnail Image (optional)</Label>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${idPrefix}-thumb-file`}
            className="flex items-center gap-3 border border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <div className="p-2 rounded-lg bg-muted">
              {uploadingThumb ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {form.thumbnailUrl ? (
                <div className="flex items-center gap-2">
                  <img
                    src={form.thumbnailUrl}
                    alt="thumb"
                    className="h-8 w-12 object-cover rounded"
                  />
                  <p className="text-sm font-medium text-green-600">
                    ✓ Thumbnail set
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {uploadingThumb
                    ? "Uploading..."
                    : "Click to upload thumbnail"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP</p>
            </div>
            <input
              ref={thumbFileInputRef}
              id={`${idPrefix}-thumb-file`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onThumbChange}
            />
          </label>
          {thumbProgress !== null && (
            <Progress value={thumbProgress} className="h-1.5" />
          )}
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-ocid="videos.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Videos</h2>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setNewForm(emptyForm);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 gap-2"
              data-ocid="videos.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            data-ocid="videos.dialog"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Video className="h-5 w-5" />
                Upload New Video
              </DialogTitle>
              <DialogDescription>
                Add a video to your website. Upload the video file and an
                optional thumbnail.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5 pt-2">
              {renderVideoFormFields(
                newForm,
                (patch) => setNewForm((p) => ({ ...p, ...patch })),
                "create",
                videoFileRef,
                thumbFileRef,
                isUploadingVideo,
                isUploadingThumb,
                videoUploadProgress,
                thumbUploadProgress,
                (e) =>
                  handleVideoFileChange(
                    e,
                    (patch) => setNewForm((p) => ({ ...p, ...patch })),
                    setVideoUploadProgress,
                    setIsUploadingVideo,
                  ),
                (e) =>
                  handleThumbFileChange(
                    e,
                    (patch) => setNewForm((p) => ({ ...p, ...patch })),
                    setThumbUploadProgress,
                    setIsUploadingThumb,
                  ),
              )}
              <div className="flex gap-3 justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={
                    createMutation.isPending ||
                    isUploadingVideo ||
                    isUploadingThumb
                  }
                  data-ocid="videos.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    isUploadingVideo ||
                    isUploadingThumb
                  }
                  className="gap-2"
                  data-ocid="videos.submit_button"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Save Video
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Table */}
      {!videos || videos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground gap-3"
          data-ocid="videos.empty_state"
        >
          <VideoOff className="h-10 w-10 opacity-30" />
          <p className="font-medium">No videos yet</p>
          <p className="text-sm">
            Upload your first video using the button above.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          data-ocid="videos.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video, index) => (
                <TableRow
                  key={video.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`videos.item.${index + 1}`}
                >
                  <TableCell>
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-12 w-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-12 w-20 rounded-md bg-muted flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {video.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate text-sm">
                    {video.description || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <Badge variant="outline">
                      {formatDate(video.uploadedAt)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(video)}
                        className="hover:bg-chart-1/10 hover:text-chart-1 hover:border-chart-1/30"
                        data-ocid={`videos.edit_button.${index + 1}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingId(video.id)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        data-ocid={`videos.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingVideo}
        onOpenChange={(open) => {
          if (!open) setEditingVideo(null);
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="videos.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit2 className="h-5 w-5" />
              Edit Video
            </DialogTitle>
            <DialogDescription>
              Update the video details and save your changes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5 pt-2">
            {renderVideoFormFields(
              editForm,
              (patch) => setEditForm((p) => ({ ...p, ...patch })),
              "edit",
              editVideoFileRef,
              editThumbFileRef,
              isEditUploadingVideo,
              isEditUploadingThumb,
              editVideoProgress,
              editThumbProgress,
              (e) =>
                handleVideoFileChange(
                  e,
                  (patch) => setEditForm((p) => ({ ...p, ...patch })),
                  setEditVideoProgress,
                  setIsEditUploadingVideo,
                ),
              (e) =>
                handleThumbFileChange(
                  e,
                  (patch) => setEditForm((p) => ({ ...p, ...patch })),
                  setEditThumbProgress,
                  setIsEditUploadingThumb,
                ),
            )}
            <div className="flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingVideo(null)}
                disabled={updateMutation.isPending}
                data-ocid="videos.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  isEditUploadingVideo ||
                  isEditUploadingThumb
                }
                className="gap-2"
                data-ocid="videos.edit.save_button"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent data-ocid="videos.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="videos.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
              data-ocid="videos.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

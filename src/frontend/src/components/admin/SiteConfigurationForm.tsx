import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Lock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteConfiguration } from "../../backend";
import {
  useGetSiteConfiguration,
  useUpdateSiteConfiguration,
} from "../../hooks/useSiteConfiguration";

const LOCK_KEY = "byteway_site_config_locked";

function isConfigFilled(config: SiteConfiguration): boolean {
  return (
    config.address.trim() !== "" ||
    config.phone.trim() !== "" ||
    config.email.trim() !== ""
  );
}

export default function SiteConfigurationForm() {
  const { data: config, isLoading } = useGetSiteConfiguration();
  const updateMutation = useUpdateSiteConfiguration();

  const [locked, setLocked] = useState<boolean>(() => {
    return localStorage.getItem(LOCK_KEY) === "true";
  });

  const [formData, setFormData] = useState<SiteConfiguration>({
    address: "",
    phone: "",
    email: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: locked is derived from config, intentionally excluded
  useEffect(() => {
    if (config) {
      setFormData(config);
      if (isConfigFilled(config)) {
        setLocked(true);
        localStorage.setItem(LOCK_KEY, "true");
      }
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    try {
      await updateMutation.mutateAsync(formData);
      setLocked(true);
      localStorage.setItem(LOCK_KEY, "true");
      toast.success(
        "Contact & social details saved permanently. They cannot be changed.",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Contact &amp; Social Media</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locked
              ? "These details are permanently locked and will always appear on your website."
              : "Fill in your details and save once — they will be locked permanently after that."}
          </p>
        </div>
        {locked && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/40 bg-green-500/10 text-green-600 text-sm font-medium shrink-0"
            data-ocid="config.locked.success_state"
          >
            <Lock className="h-4 w-4" />
            Permanently Locked
          </div>
        )}
      </div>

      {locked ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4 p-6 rounded-lg border border-green-500/20 bg-card">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Contact Information
            </h3>
            <div className="grid gap-4">
              <ReadField label="Address" value={formData.address} />
              <ReadField label="Phone" value={formData.phone} />
              <ReadField label="Email" value={formData.email} />
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-green-500/20 bg-card">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Social Media
            </h3>
            <div className="grid gap-4">
              <ReadField
                label="Facebook"
                value={formData.socialMedia.facebook}
              />
              <ReadField
                label="X (Twitter)"
                value={formData.socialMedia.twitter}
              />
              <ReadField
                label="Instagram"
                value={formData.socialMedia.instagram}
              />
              <ReadField
                label="LinkedIn"
                value={formData.socialMedia.linkedin}
              />
              <ReadField label="YouTube" value={formData.socialMedia.youtube} />
              <ReadField
                label="WhatsApp"
                value={formData.socialMedia.whatsapp}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 text-sm">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              These details are <strong>permanently saved</strong> and cannot be
              edited or changed.
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 text-sm flex items-start gap-3">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>One-time setup:</strong> You can only save these details
              once. After saving, they will be locked permanently and cannot be
              changed.
            </span>
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  data-ocid="config.address.input"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main St, City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  data-ocid="config.phone.input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-ocid="config.email.input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@byteway.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold">Social Media</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  data-ocid="config.facebook.input"
                  value={formData.socialMedia.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="https://facebook.com/byteway"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X (Twitter) URL</Label>
                <Input
                  id="twitter"
                  data-ocid="config.twitter.input"
                  value={formData.socialMedia.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="https://x.com/byteway"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  data-ocid="config.instagram.input"
                  value={formData.socialMedia.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="https://instagram.com/byteway"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  data-ocid="config.linkedin.input"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        linkedin: e.target.value,
                      },
                    })
                  }
                  placeholder="https://linkedin.com/company/byteway"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <Input
                  id="youtube"
                  data-ocid="config.youtube.input"
                  value={formData.socialMedia.youtube}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        youtube: e.target.value,
                      },
                    })
                  }
                  placeholder="https://youtube.com/@byteway"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number / Link</Label>
                <Input
                  id="whatsapp"
                  data-ocid="config.whatsapp.input"
                  value={formData.socialMedia.whatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialMedia: {
                        ...formData.socialMedia,
                        whatsapp: e.target.value,
                      },
                    })
                  }
                  placeholder="https://wa.me/1234567890"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            data-ocid="config.save.primary_button"
            className="bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Permanently
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground bg-muted/40 px-3 py-2 rounded-md border border-border/50 min-h-[36px]">
        {value || (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </p>
    </div>
  );
}

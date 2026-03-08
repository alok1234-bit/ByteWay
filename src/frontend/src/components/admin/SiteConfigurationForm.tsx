import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteConfiguration } from "../../backend";
import {
  useGetSiteConfiguration,
  useUpdateSiteConfiguration,
} from "../../hooks/useSiteConfiguration";

export default function SiteConfigurationForm() {
  const { data: config, isLoading } = useGetSiteConfiguration();
  const updateMutation = useUpdateSiteConfiguration();

  const [formData, setFormData] = useState<SiteConfiguration>({
    address: "",
    phone: "",
    email: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Site configuration updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update configuration");
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
      <h2 className="text-2xl font-semibold">Site Configuration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
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
          </div>
        </div>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
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
              Save Configuration
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

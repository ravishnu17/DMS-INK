class AuditMixin:
    def get_audit_title(self):
        # Override this in model to customize title shown in logs
        return getattr(self, "name", f"{self.__class__.__name__} #{self.id}")

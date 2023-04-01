import TypeWidget from "./type_widget.js";
import server from "../../services/server.js";
import AttachmentDetailWidget from "../attachment_detail.js";

const TPL = `
<div class="attachments note-detail-printable">
    <style>
        .attachments {
            padding: 15px;
        }
    </style>

    <div class="attachment-list"></div>
</div>`;

export default class AttachmentsTypeWidget extends TypeWidget {
    static getType() {
        return "attachments";
    }

    doRender() {
        this.$widget = $(TPL);
        this.$list = this.$widget.find('.attachment-list');

        super.doRender();
    }

    async doRefresh(note) {
        this.$list.empty();
        this.children = [];
        this.renderedAttachmentIds = new Set();

        const attachments = await server.get(`notes/${this.noteId}/attachments?includeContent=true`);

        if (attachments.length === 0) {
            this.$list.html("<strong>This note has no attachments.</strong>");

            return;
        }

        for (const attachment of attachments) {
            const attachmentDetailWidget = new AttachmentDetailWidget(attachment);
            this.child(attachmentDetailWidget);

            this.renderedAttachmentIds.add(attachment.attachmentId);

            this.$list.append(attachmentDetailWidget.render());
        }
    }

    async entitiesReloadedEvent({loadResults}) {
        // updates and deletions are handled by the detail, for new attachments the whole list has to be refreshed
        const attachmentsAdded = loadResults.getAttachments()
            .find(att => this.renderedAttachmentIds.has(att.attachmentId));

        if (attachmentsAdded) {
            this.refresh();
        }
    }
}

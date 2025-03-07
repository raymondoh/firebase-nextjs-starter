import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
export default function UserNotificationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="Optional description text" />
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          {/* Section content */}
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro eum non minus dolore deleniti, atque
            veritatis impedit molestiae quas repudiandae culpa voluptatum, illo asperiores consequuntur numquam! Ad
            labore aliquid aperiam consequuntur assumenda, doloribus magni alias est saepe pariatur laborum natus iusto
            impedit explicabo dolorum obcaecati? Amet dignissimos dicta et eum soluta magni ut, autem commodi. Nihil,
            itaque. Quis nihil eaque, aspernatur fugiat, itaque ut, rerum doloribus ab dolores distinctio magnam rem
            veniam dolorum nesciunt corporis suscipit voluptatibus officiis exercitationem ea repellendus sit aliquam.
            Mollitia eligendi eum laudantium distinctio obcaecati omnis, possimus ex asperiores quae necessitatibus in
            libero reiciendis est voluptatum.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          {/* Another section */} Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quaerat fugit deserunt
          voluptas nam suscipit ratione aliquam assumenda accusamus, possimus mollitia harum. Architecto repudiandae
          rerum illum harum ipsam quia nam cumque, quis tempore necessitatibus eum maxime quisquam iure mollitia rem
          eveniet placeat repellendus non eos! Voluptatum et nam iure fugiat architecto nisi neque ut ducimus ipsum?
          Assumenda, saepe commodi. Voluptatem, deserunt quo nostrum doloremque saepe nihil facere, quisquam porro quod
          ullam perspiciatis obcaecati! Ab cumque voluptas, maiores dignissimos aliquam ducimus cum corporis error, sed
          culpa et quasi! Sapiente hic praesentium ex sequi eos, dolores culpa molestias veniam dignissimos temporibus
          saepe? Ratione?
        </div>
      </div>
    </DashboardShell>
  );
}

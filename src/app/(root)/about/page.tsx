"use client";
import { useSession } from "next-auth/react";

export default function AboutPage() {
  const { data: session } = useSession();
  console.log("Client-side session:", session);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">Welcome to our About page. Here you can learn more about our company, mission, and values.</p>
      <p>We are dedicated to providing high-quality services and innovative solutions to our customers.</p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste ipsa maxime ea voluptas totam labore tempore vitae
        earum, odio aliquid consectetur vel neque delectus incidunt molestias reiciendis voluptate? Et ea pariatur fuga
        accusamus exercitationem optio, natus, quae placeat nulla nobis quos esse quidem, mollitia blanditiis nesciunt
        reprehenderit adipisci dignissimos temporibus quaerat sit reiciendis hic! Ex dolores natus tempore repellat
        eaque ea temporibus ab, animi impedit aliquam nulla vero explicabo voluptatum. Molestiae magni dolor modi amet
        adipisci error eligendi placeat enim delectus voluptas dolores, possimus voluptatibus? Quod quibusdam, quos
        unde, eius consectetur fugiat recusandae itaque impedit nam est possimus nulla tempora ab cumque hic ut vero aut
        ducimus quaerat sunt perferendis voluptatum corporis necessitatibus. Mollitia itaque enim officiis cumque
        doloremque iste tenetur vero nesciunt quos aperiam! Iure voluptatum ipsum dolores illum omnis voluptates porro
        possimus. Autem, doloremque corporis at natus illo odit. Quaerat corporis ullam delectus expedita quod quia
        autem quibusdam hic, optio voluptatem omnis, fuga facere dolores ducimus minima perferendis, amet laborum? At,
        eligendi dolorum! Libero dicta commodi doloribus? Est esse suscipit voluptatibus animi illo iste aliquam
        voluptate ipsum harum corporis officiis, fuga dolores molestiae explicabo sit vero odit accusamus aperiam
        incidunt eius, nihil, nulla quasi perferendis. Architecto atque aut reiciendis alias earum aliquid odit quia,
        facere beatae ex necessitatibus numquam, libero saepe perspiciatis voluptas animi voluptate ratione laborum
        itaque? Tenetur delectus magni molestiae, animi odio dicta nemo vero facere quae! Animi dolorum cumque labore
        voluptas ipsum. Sed, nam quis facere, nobis vero magnam eveniet doloribus rerum in tempora expedita blanditiis
        porro libero dolores voluptatem. Amet quam ab voluptas qui aut voluptatibus labore. Fugiat, minima voluptatum
        nostrum sed a facilis. Expedita reiciendis dolore sequi voluptate unde aspernatur consequatur sit cum.
        Necessitatibus non ratione quas voluptate eum mollitia temporibus voluptatum dolorum nam excepturi quo optio
        explicabo perspiciatis veritatis, natus laudantium dolore.
      </p>
    </div>
  );
}
